import { AxiosError } from "axios";
import i18n from "../i18n";
import { useUserStore } from "../stores/user";
import { datetime } from "./timestamp";

function getDeepValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export function getErrorMessage(err: AxiosError, errorsI18nPath?: string): string {
    const locale = i18n.global.locale.value;
    const messages: any = i18n.global.getLocaleMessage(locale);
    const userStore = useUserStore()

    if ((err.response?.data as any)?.message?.split(':')[0] === 'failed_moderation') {
        return `${i18n.global.t(`errors.failed_moderation`)}: ${(err.response?.data as any)?.message?.split(':')[1]}`
    }
    
    if (errorsI18nPath) {
        const customErrors = getDeepValue(messages, errorsI18nPath);
        
        const serverMessage = (err.response?.data as any)?.message;
        if (customErrors && serverMessage && Object.keys(customErrors).includes(serverMessage)) {
            return i18n.global.t(`${errorsI18nPath}.${serverMessage}`);
        }
    }
    
    const serverMessage = (err.response?.data as any)?.message;
    if (messages.errors && Object.keys(messages.errors.general).includes(serverMessage)) {
        if (serverMessage === 'restricted') {
            return `${i18n.global.t(`errors.general.${serverMessage}`)} (${datetime.from(userStore.restriction!.start_at)} - ${datetime.from(userStore.restriction!.finish_at)})`;
        }
        return `${i18n.global.t(`errors.general.${serverMessage}`)}`;
    }
    
    const status = String(err.response?.status);
    if (messages.errors && Object.keys(messages.errors.statuses).includes(status)) {
        return `${i18n.global.t(`errors.statuses.${status}`)}`;
    }

    return i18n.global.t('errors.fallback');
}
