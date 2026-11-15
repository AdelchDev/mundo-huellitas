import { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Posteo from '../posteo';
import { getPosteos } from '../../services/posteos';
import { getAnimales } from '../../services/animales';

const ListadoPosteos = () => {
    const [posteos, setPosteos] = useState([]);
    const [animales, setAnimales] = useState([]);

    useEffect(() => {
        getPosteos().then(posteos => {
            setPosteos(posteos);
        })
        .catch(error => {
            console.log('Error al obtener posteos:', error);
        });

        getAnimales().then(animales => {
            setAnimales(animales);
        })
        .catch(error => {
            console.log('Error al obtener animales:', error);
        });
    }, []);

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
            <FlatList
                data={posteos}
                renderItem={({ item }) => {
                    const animal = animales.find(
                        animal => animal.id === item.idAnimal
                    );
                    return <Posteo posteo={item} animal={animal} />;
                }}
                keyExtractor={item => item.id.toString()}
            />
        </SafeAreaView>
    );
};

export default ListadoPosteos;