//---------------var, let, const-------------\\
    document.write("Hello World!");
    console.log(x);
    var x = 5;
    console.log(x);

    let y = 15;
    console.log(y);

//---------------premitive/non-premitive data-------------\\
    const name = {
        firstName: "John",
        lastName: "Doe",
        age: 30
    };
    console.log(name.firstName);
    delete name.firstName;
    console.log(name.firstName);

    const numbers = [1, 2, 3, 4, 5];
    numbers.push(6);
    console.log(numbers[2]);

    function say_something(message) {
        console.log(message);
    }
    say_something("Hello there!");

//---------------loop-------------\\
    for(let i = 0; i < 10; i++) {
        // if(i + 1 == 5) continue; 
        console.log(i + 1, ": Hello");
    }

    let x = 0;
    while(x < 10) {
        console.log(x + 1, ": Hello");
        x++;
    }
    
    x = 0;
    do {
        console.log(x + 1, ": Hello");
        x++;
    } while(x < 10);

//---------------loop in objects-------------\\
    
    for(let key in name) {
        console.log(key, ":", name[key]);
    }

    for(const i of numbers) {
        console.log(i);
    }
    