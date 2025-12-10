import axios from "axios";
import {
    TemplateExportPayload,
    TemplateTransferRecord,
} from "@/types/api";

export const API_BASE_URL = "http://95.40.32.78";

const twmj_api = axios.create({
    baseURL: API_BASE_URL,
});

export function exportTemplate(payload: TemplateExportPayload) {
    return twmj_api.post<TemplateTransferRecord>("/templates/export", payload);
}

export function fetchRemoteTemplate(uuid: string) {
    return twmj_api.get<TemplateTransferRecord>(`/templates/import/${uuid}`);
}

export default twmj_api;
