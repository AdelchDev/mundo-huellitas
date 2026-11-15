import { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import Animal from '../animal';
import { getAnimales } from '../../services/animales';
import { apiRequest } from "../services/api";

const ListadoAnimales = () => {
    const [animales, setAnimales] = useState([]);

    useEffect(() => {
        getAnimales().then(animales => {
            setAnimales(animales);
        });
    }, []);

    return (
        <FlatList
            data={animales}
            renderItem={({ item }) => <Animal animal={item} />}
            keyExtractor={item => item.id.toString()}
        />
    );
};

export default ListadoAnimales;