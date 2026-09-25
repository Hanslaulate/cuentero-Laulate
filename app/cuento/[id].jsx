import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

export default function Editor() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [modificado, setModificado] = useState(false);

  const esNuevo = id === 'nuevo';

  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');

  useEffect(() => {
    if (esNuevo) return;

    async function cargar() {
      const fila = await db.getFirstAsync(
        'SELECT titulo, cuerpo FROM cuento WHERE id = ?',
        [Number(id)]
      );

      if (fila) {
        setTitulo(fila.titulo);
        setCuerpo(fila.cuerpo);
        setModificado(false);
      }
    }

    cargar();
  }, [id, esNuevo, db]);

  async function guardar() {
    const limpio = titulo.trim();

    if (!limpio) {
      Alert.alert('Falta el título', 'Todo cuento necesita un nombre.');
      return;
    }

    const ahora = new Date().toISOString();

    if (esNuevo) {
      await db.runAsync(
        'INSERT INTO cuento (titulo, cuerpo, creado, editado) VALUES (?, ?, ?, ?)',
        [limpio, cuerpo, ahora, ahora]
      );
    } else {
      await db.runAsync(
        'UPDATE cuento SET titulo = ?, cuerpo = ?, editado = ? WHERE id = ?',
        [limpio, cuerpo, ahora, Number(id)]
      );
    }

    setModificado(false);
    router.back();
  }

  function salir() {
    if (!modificado) {
      router.back();
      return;
    }

    Alert.alert(
      'Cambios sin guardar',
      '¿Deseas salir sin guardar los cambios?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  }

  function confirmarBorrado() {
    Alert.alert(
      'Borrar cuento',
      'Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await db.runAsync(
              'DELETE FROM cuento WHERE id = ?',
              [Number(id)]
            );
            router.back();
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: esNuevo ? 'Nuevo cuento' : 'Editar cuento',
          headerBackVisible: false,
        }}
      />

      <Pressable onPress={salir}>
        <Text style={styles.volver}>← Volver</Text>
      </Pressable>

      <TextInput
        style={styles.titulo}
        placeholder="Título del cuento"
        value={titulo}
        onChangeText={(texto) => {
          setTitulo(texto);
          setModificado(true);
        }}
      />

      <TextInput
        style={styles.cuerpo}
        placeholder="Había una vez, en la quebrada..."
        value={cuerpo}
        onChangeText={(texto) => {
          setCuerpo(texto);
          setModificado(true);
        }}
        multiline
        textAlignVertical="top"
      />

      {/* CONTADOR DE PALABRAS - T2 */}
      <Text style={styles.contadorPalabras}>
        Palabras: {cuerpo.trim() ? cuerpo.trim().split(/\s+/).length : 0}
      </Text>

      <Pressable style={styles.guardar} onPress={guardar}>
        <Text style={styles.guardarTexto}>Guardar</Text>
      </Pressable>

      {!esNuevo && (
        <Pressable onPress={confirmarBorrado}>
          <Text style={styles.borrar}>Borrar este cuento</Text>
        </Pressable>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f7f5f0',
    padding: 16,
    gap: 12,
  },

  volver: {
    color: '#1b4332',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 6,
  },

  titulo: {
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8e2d5',
  },

  cuerpo: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8e2d5',
  },

  contadorPalabras: {
    fontSize: 13,
    color: '#7a8b7f',
    marginTop: -4,
  },

  guardar: {
    backgroundColor: '#1b4332',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },

  guardarTexto: {
    color: '#fff',
    fontWeight: '600',
  },

  borrar: {
    textAlign: 'center',
    color: '#a4161a',
    paddingVertical: 10,
  },
});