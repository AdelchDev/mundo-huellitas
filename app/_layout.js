import Navigation from './navigation';
import { FavoritosProvider } from '../context/favoritosContext';

export default function RootLayout() {
    return (
        <FavoritosProvider>
            <Navigation />
        </FavoritosProvider>
    );
}