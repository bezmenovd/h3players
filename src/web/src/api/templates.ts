import { Paginated } from "./_general";
import api from "../api";

export type Template = {
    id: number
    name: string
}

export type TemplateStats = {
    games_count: number
    games_duration: number
    players_count: number
}

export type TemplateWithInfo = Template & TemplateStats & {
    
}

export type TemplateGamesChartItem = {
    start_of_day: number
    games_count: number
}

export type TemplatesDurationChartItem = {
    duration: number
    games_count: number
}

export type TemplatesEndDayChartItem = {
    end_day: number
    games_count: number
}

export async function getList(limit: number, offset: number, ids: number[] = [], query?: string): Promise<Paginated<TemplateWithInfo>> {
    return api.get(`/templates`, {
        params: {
            limit,
            offset,
            ...(ids?.length ? { ids: ids.join(',') } : {}),
            ...(query?.length ? { query } : {}),
        }
    }).then(r => r.data);
}

export type TemplateDetailInfo = {
    template: Template
    versions: Template[]
    stats: TemplateStats
    charts: {
        games: TemplateGamesChartItem[],
        duration: TemplatesDurationChartItem[],
        end_day: TemplatesEndDayChartItem[],
    }
}

export async function getTemplate(id: number): Promise<TemplateDetailInfo> {
    return api.get(`/templates/${id}`).then(r => r.data)
}

export type TemplatesStatisticsChartItem = {
    start_of_day: number
    templates: {
        [key: string]: number
    }
}

export async function getStatistics(): Promise<TemplatesStatisticsChartItem[]> {
    return api.get(`/templates/statistics`).then(r => r.data)
}
