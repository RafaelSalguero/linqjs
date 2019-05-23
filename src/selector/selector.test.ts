import { createSelector, toSelector } from "./selector"
test("selector simple test", () => {
    interface Props {
        a: number;
        b: number;
    }

    const a = toSelector((x: Props) => x.a);
    const b = toSelector((x: Props) => x.b);

    let a1Calls = 0;
    const a1 = createSelector({
        a: a
    }, (curr) => {
        a1Calls++;
        return curr.a + 5;
    });

    let b1Calls = 0;
    const b1 = createSelector({
        b: b
    }, (curr) => {
        b1Calls++;
        return curr.b + 2;
    });

    let abCalls = 0;
    const ab = createSelector({
        a: a1,
        b: b1
    }, curr => {
        abCalls++;
        return curr.a * curr.b;
    });

    {
        const r1 = ab.call({
            a: 2,
            b: 3
        });

        expect(r1).toBe(35);
        expect(a1Calls).toBe(1);
        expect(b1Calls).toBe(1);
        expect(abCalls).toBe(1);
    }

    {
        //Llamar de nuevo, con los mismos props:
        ab.call({
            a: 2,
            b: 3
        });

        expect(a1Calls).toBe(1);
        expect(b1Calls).toBe(1);
        expect(abCalls).toBe(1);
    }

    {
        //Cambiar sólo un prop:
       const r2 = ab.call({
            a: 1,
            b: 3
        });

        expect(r2).toBe(30);
        expect(a1Calls).toBe(2);
        expect(b1Calls).toBe(1);
        expect(abCalls).toBe(2);
    }
});

test("selector multiple", async () => {
    interface Props {
        a: number;
        b: number;
    }
    const a = toSelector((x: {x: Props, state: number}) => x.x.a);
    const b = toSelector((x: {x: Props, state: number}) => x.x.b);
    const c = toSelector((x: {x: Props, state: number}) => x.x.b + x.state);

    const sum = createSelector({a, b, c}, x => x.a + x.b + x.c);

    expect(sum.call({x: { a: 1, b: 2 }, state: 5})).toBe(10);
});