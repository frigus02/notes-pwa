import { useEffect, useState, type Inputs } from "preact/hooks";

export function useQuery<T>(
    query: () => Promise<T>,
    inputs?: Inputs,
): T | undefined {
    const [value, setValue] = useState<T>();
    useEffect(() => {
        query().then((value) => {
            setValue(value);
        });
    }, inputs);
    return value;
}
