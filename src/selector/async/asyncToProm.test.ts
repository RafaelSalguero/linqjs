import * as rx from "rxjs";
import { obsToPromise, syncResolve, delay, doOnSubscribe, splitPromise, syncPromiseValue, isSyncPromise } from "../../logic";
import { toSelector } from "../selector";
import { createSelectorAsync } from "./async";

test("observable to prom sync", async () => {
    const obs = rx.from([10, 20]);
    const prom = obsToPromise(obs);

    let result = 0;
    prom.then(x => result = x);
    expect(result).toBe(20);
});

test("observable to prom from prom sync", async () => {
    const obs = rx.from(syncResolve(20));
    const prom = obsToPromise(obs);

    let result = 0;
    prom.then(x => result = x);
    expect(result).toBe(20);
});

test("observable to prom async", async () => {
    //Verifica que el numero de subscripciones ocasioando por el toPromise sea igual al obsToPromise:
    let sub1 = 0;
    let sub2 = 0;

    const obs1 = rx.from(delay(10).then(x => 20)).pipe(doOnSubscribe(() => sub1++));
    const obs2 = rx.from(delay(10).then(x => 20)).pipe(doOnSubscribe(() => sub2++));

    const prom1 = obs1.toPromise();
    const prom2 = obsToPromise(obs2);

    expect(sub1).toBe(sub2);

    let result1 = 0, result2 = 0;
    prom1.then(x => result1 = x);
    expect(result1).toBe(0);
    
    prom2.then(x => result2 = x);
    expect(result2).toBe(0);

    expect(sub1).toBe(sub2);

    await Promise.all( [prom1, prom2]);
    expect(result1).toBe(20);
    expect(result2).toBe(20);

    expect(sub1).toBe(sub2);
});

test("sync promise = sync selector",  () => {
    const func =   (id: number) => syncResolve(30);

    const idSel = toSelector((id: number) => id);
    const funcSel = createSelectorAsync({idSel}, s => func(s.idSel));

    const prom1 = funcSel.call(0);
    //La primera llamada es asíncrona:
    expect(syncPromiseValue(prom1)).toEqual({ 
        value: 30,
        status: "resolved"
    });

});

test("promise resolved is sync", async () => {
    //La función es asíncrona y devuelve 20
    const func = async (id: number) => {
        delay(10);
        return 20;
    };

    const idSel = toSelector((id: number) => id);
    const funcSel = createSelectorAsync({idSel}, s => func(s.idSel));

    const prom1 = funcSel.call(0);
    //La primera llamada es asíncrona:
    expect(isSyncPromise(prom1)).toBe(false);

    const value = await prom1;
    expect(value).toBe(20);

    const prom2 = funcSel.call(2);
    //La segunda llamada es síncrona:
    expect(isSyncPromise( prom2)).toBe(true);
});