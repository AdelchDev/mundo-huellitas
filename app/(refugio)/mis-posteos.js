import { Redirect } from 'expo-router';

/** Compat: la pestaña pasó a llamarse posteos */
export default function MisPosteosRedirect() {
    return <Redirect href="/(refugio)/posteos" />;
}
