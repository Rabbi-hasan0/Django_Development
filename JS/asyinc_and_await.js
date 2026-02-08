const getData = async() => {
    try {
        const data = await fetch("https://jsonplaceholder.typicode.com/users/1");
        const user = await data.json();
        console.log(user);
    } catch (error) {
        console.log(error);
    }
}

getData();