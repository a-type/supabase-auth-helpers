import { SupabaseClient, User } from '@supabase/supabase-js';
import { writable } from 'svelte/store';

type UserFetcher = (
  url: string
) => Promise<{ user: User | null; accessToken: string | null }>;

const userFetcher: UserFetcher = async (url) => {
  const response = await fetch(url);
  return response.ok ? response.json() : { user: null, accessToken: null };
};

export interface Props {
  supabaseClient: SupabaseClient;
  callbackUrl?: string;
  profileUrl?: string;
  user?: User;
  fetcher?: UserFetcher;
  [propName: string]: any;
}

export const UserStore = (props: Props) => {
  const {
    supabaseClient,
    callbackUrl = '/api/auth/callback',
    profileUrl = '/api/auth/user',
    user: initialUser = null,
    fetcher = userFetcher
  } = props;

  const user = writable<User | null>(initialUser);
  const accessToken = writable<string | null>(null);
  const isLoading = writable<boolean>(!initialUser);
  const error = writable<Error>();

  console.log('UserStore initiated!!!');
  const checkSession = async (): Promise<void> => {
    try {
      const { user: usr, accessToken: accToken } = await fetcher(profileUrl);
      console.log({ usr, accToken });
      if (accToken) {
        supabaseClient.auth.setAuth(accToken);
        accessToken.set(accToken);
      }
      user.set(usr);
      if (!usr) isLoading.set(false);
    } catch (e) {
      const err = new Error(`The request to ${profileUrl} failed`);
      error.set(err);
    }
  };

  async function runOnPathChange() {
    isLoading.set(true);
    await checkSession();
    isLoading.set(false);
  }

  const checkAuthState = () => {
    console.log('checkAuthState called!!!');

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('inside onAUthStateChange');
        isLoading.set(true);
        // Forward session from client to server where it is set in a Cookie.
        // NOTE: this will eventually be removed when the Cookie can be set differently.
        await fetch(callbackUrl, {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session })
        }).then((res) => {
          console.log(`Checking response`);
          if (!res.ok) {
            console.log(`The request to ${callbackUrl} failed`);
            const err = new Error(`The request to ${callbackUrl} failed`);
            error.set(err);
          }
        });
        console.log('Checking from API route');
        // Fetch the user from the API route
        await checkSession();
        isLoading.set(false);
      }
    );

    return authListener;
  };

  return {
    isLoading,
    user,
    accessToken,
    error,
    checkAuthState,
    runOnPathChange
  };
};
