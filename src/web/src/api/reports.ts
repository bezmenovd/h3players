import api from "../api";

export async function add(entity_type: number, entity_id: number, reason: string): Promise<void> {
    return api.post(`/reports/add`, {
        entity_type,
        entity_id,
        reason,
    })
}
