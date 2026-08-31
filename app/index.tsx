import { Redirect } from 'expo-router';

/** Entry point: alihkan ke dashboard (guard auth di root layout menangani login). */
export default function Index() {
  return <Redirect href="/(app)/dashboard" />;
}
