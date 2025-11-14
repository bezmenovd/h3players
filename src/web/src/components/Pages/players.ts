import { ref, computed } from "vue";
import type { Player } from "../../api/players";

interface StoredPlayer {
    player: Player;
    count: number;
}

export function useSearchHistory() {
    const _items = ref<Map<number, StoredPlayer>>(new Map());

    function load() {
        const serialized = localStorage.getItem('players.search-history') || '[]';
        const unserialized = JSON.parse(serialized) as StoredPlayer[];

        _items.value.clear();
        for (const p of unserialized) {
            _items.value.set(p.player.id, p);
        }
    }

    function save() {
        localStorage.setItem('players.search-history', JSON.stringify(Array.from(_items.value.values())));
    }

    function add(player: Player) {
        const existing = _items.value.get(player.id);
        if (existing) {
            existing.player.name = player.name;
            existing.count += 1;
            _items.value.set(player.id, existing);
        } else {
            _items.value.set(player.id, { player, count: 1 });
        }
        save();
    }

    function remove(player: Player) {
        _items.value.delete(player.id);
        save();
    }

    function clear() {
        _items.value.clear();
        localStorage.removeItem('players.search-history');
    }

    const items = computed<Player[]>(() => {
        return Array.from(_items.value.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .map(s => s.player);
    });

    return {
        items,
        load,
        save,
        add,
        remove,
        clear,
    };
}