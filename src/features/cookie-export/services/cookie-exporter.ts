import { GM_cookie } from '$';
import { failureResult, successResult, type OperationResult } from '@/types';

interface ReadableCookie {
    /** Cookie 名称。 */
    name: string;
    /** Cookie 原始值。 */
    value: string;
}

export interface CookieExportResult {
    /** 符合标准 Cookie 请求头格式的完整文本。 */
    text: string;
    /** 当前地址适用的 Cookie 数量。 */
    count: number;
}

/** 读取当前交易地址适用的 Cookie，包含扩展有权读取的 HttpOnly Cookie。 */
const listCurrentCookies = (): Promise<ReadableCookie[]> =>
    new Promise((resolve, reject) => {
        GM_cookie.list({ url: window.location.href }, (cookies, error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(cookies.map(cookie => ({ name: cookie.name, value: cookie.value })));
        });
    });

/** 获取全部当前 Cookie，并生成可直接作为请求头使用的文本。 */
export const exportCurrentCookies = async (): Promise<OperationResult<CookieExportResult>> => {
    try {
        const cookies = await listCurrentCookies();
        const validCookies = cookies.filter(cookie => cookie.name.trim());
        if (!validCookies.length) throw new Error('当前交易地址没有可读取的 Cookie');

        return successResult({
            text: validCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '),
            count: validCookies.length,
        });
    } catch (error) {
        return failureResult(error, '读取当前交易地址 Cookie 失败');
    }
};
