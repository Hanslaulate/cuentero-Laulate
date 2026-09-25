import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

export default function Lista() {
  const db = useSQLiteContext();
  const router = useRouter();
  const esquema = useColorScheme();

  const [cuentos, setCuentos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargar() {
        const filas = await db.getAllAsync(
          'SELECT id, titulo, cuerpo, editado FROM cuento WHERE titulo LIKE ? ORDER BY editado DESC',
          [`%${busqueda}%`]
        );

        if (activo) setCuentos(filas);
      }

      cargar();

      return () => {
        activo = false;
      };
    }, [db, busqueda])
  );

  const oscuro = esquema === 'dark';

  return (
    <View
      style={[
        styles.contenedor,
        oscuro && styles.contenedorOscuro,
      ]}
    >
      <Stack.Screen
        options={{
          title: 'Cuentero',
          headerRight: () => (
            <Pressable onPress={() => router.push('/ajustes')}>
              <Text style={{ color: '#fff', fontSize: 16 }}>
                Ajustes
              </Text>
            </Pressable>
          ),
        }}
      />

      {/* CONTADOR DE CUENTOS - T1 */}
      <Text
        style={[
          styles.contador,
          oscuro && styles.textoOscuro,
        ]}
      >
        Mis cuentos: {cuentos.length}
      </Text>

      {/* BUSCADOR - T6 */}
      <TextInput
        style={[
          styles.busqueda,
          oscuro && styles.inputOscuro,
        ]}
        placeholder="Buscar por título..."
        placeholderTextColor={oscuro ? '#aaa' : '#777'}
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <FlatList
        data={cuentos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <Text
            style={[
              styles.vacio,
              oscuro && styles.textoOscuro,
            ]}
          >
            No se encontraron cuentos.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.tarjeta,
              oscuro && styles.tarjetaOscura,
            ]}
            onPress={() => router.push(`/cuento/${item.id}`)}
          >
            {/* VISTA PREVIA - T3 */}
            <Text style={styles.tarjetaTitulo}>
              {item.titulo}
            </Text>

            <Text
              style={[
                styles.tarjetaCuerpo,
                oscuro && styles.textoClaro,
              ]}
              numberOfLines={2}
            >
              {item.cuerpo}
            </Text>

            <Text style={styles.tarjetaFecha}>
              {new Date(item.editado).toLocaleDateString('es-PE')}
            </Text>
          </Pressable>
        )}
      />

      <Pressable
        style={styles.boton}
        onPress={() => router.push('/cuento/nuevo')}
      >
        <Text style={styles.botonTexto}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f7f5f0',
  },

  contenedorOscuro: {
    backgroundColor: '#121212',
  },

  contador: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b4332',
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  textoOscuro: {
    color: '#fff',
  },

  busqueda: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e8e2d5',
    color: '#222',
  },

  inputOscuro: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#fff',
  },

  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e2d5',
  },

  tarjetaOscura: {
    backgroundColor: '#242424',
    borderColor: '#444',
  },

  tarjetaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4332',
  },

  tarjetaCuerpo: {
    fontSize: 14,
    color: '#4f5d52',
    marginTop: 6,
    lineHeight: 20,
  },

  textoClaro: {
    color: '#ddd',
  },

  tarjetaFecha: {
    fontSize: 12,
    color: '#7a8b7f',
    marginTop: 4,
  },

  vacio: {
    textAlign: 'center',
    color: '#7a8b7f',
    marginTop: 40,
  },

  boton: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1b4332',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  botonTexto: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 32,
  },
});