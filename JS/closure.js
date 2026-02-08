function outer() {
    let cnt = 0;
    function inner() {
        cnt++;
        console.log("Count is: " + cnt);
    }
    return inner;
}

const myOuter = outer();
myOuter();
myOuter();
myOuter();