import { createContext, useContext, useState } from 'react';

const favoritosContext = createContext();

export const FavoritosProvider = ({ children }) => {
    const [favoritos, setFavoritos] = useState([]);

    const toggleFavorito = (idAnimal) => {
        setFavoritos(favoritos => {
            if (favoritos.includes(idAnimal)) {
                return favoritos.filter(id => id !== idAnimal);
            }

            return [...favoritos, idAnimal];
        });
    };

    const esFavorito = (idAnimal) => {
        return favoritos.includes(idAnimal);
    };

    return (
        <favoritosContext.Provider
            value={{ favoritos, toggleFavorito, esFavorito }}
        >
            {children}
        </favoritosContext.Provider>
    );
};

export const useFavoritos = () => {
    return useContext(favoritosContext);
};
