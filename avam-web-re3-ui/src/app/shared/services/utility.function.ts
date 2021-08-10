export function hasObjKey(obj: any, key?: string): boolean {
    if (!obj) {
        return false;
    } else if (!key) {
        return true;
    } else {
        return key.split('.').every(function(x) {
            if (typeof obj !== 'object' || obj === null || !(x in obj)) {
                return false;
            }
            obj = obj[x];
            return true;
        });
    }
}
