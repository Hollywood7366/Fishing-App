import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { zones } from './zones';
import { countTiles, estimateSizeKB, downloadZone } from './tileDownloader';

const formatSize = (kb) => {
  if (kb >= 1024 * 1024) return `${(kb / (1024 * 1024)).toFixed(1)} GB`;
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb.toFixed(0)} KB`;
};

const ZoneCard = ({ zone, status, progress, onDownload }) => {
  const estTiles = useMemo(() => countTiles(zone), [zone]);
  const estSize = useMemo(() => estimateSizeKB(estTiles), [estTiles]);
  const pct = progress?.total ? Math.floor((progress.done / progress.total) * 100) : null;

  return (
    <View style={styles.card}>
      <Image source={{ uri: zone.photo }} style={styles.photo} />
      <View style={styles.cardBody}>
        <Text style={styles.title}>{zone.name}</Text>
        <Text style={styles.sub}>Est: {estTiles} tiles • ~{formatSize(estSize)}</Text>
        {status ? <Text style={styles.status}>{status}</Text> : null}
        {pct !== null ? <Text style={styles.status}>Progress: {pct}% ({progress.done}/{progress.total})</Text> : null}
        <TouchableOpacity style={styles.button} onPress={onDownload} disabled={progress?.total && progress.done < progress.total}>
          <Text style={styles.buttonText}>Download {zone.name} (High Detail)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const MyMapsScreen = () => {
  const [statusById, setStatusById] = useState({});
  const [progressById, setProgressById] = useState({});

  const handleDownload = async (zone) => {
    setStatusById((s) => ({ ...s, [zone.id]: 'Starting…' }));
    setProgressById((p) => ({ ...p, [zone.id]: { done: 0, total: 0 } }));
    try {
      await downloadZone(zone, {
        onStatus: (msg) => setStatusById((s) => ({ ...s, [zone.id]: msg })),
        onProgress: (pr) => setProgressById((p) => ({ ...p, [zone.id]: pr }))
      });
      setStatusById((s) => ({ ...s, [zone.id]: 'Complete' }));
    } catch (e) {
      setStatusById((s) => ({ ...s, [zone.id]: e.message }));
    }
  };

  return (
    <FlatList
      data={zones}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ZoneCard
          zone={item}
          status={statusById[item.id]}
          progress={progressById[item.id]}
          onDownload={() => handleDownload(item)}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2
  },
  photo: {
    height: 160,
    width: '100%'
  },
  cardBody: {
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4
  },
  sub: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6
  },
  status: {
    fontSize: 13,
    color: '#0a6',
    marginBottom: 6
  },
  button: {
    backgroundColor: '#0a6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  }
});

export default MyMapsScreen;




