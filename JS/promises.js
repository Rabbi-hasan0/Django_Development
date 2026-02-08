
const getData = () => {
    return new Promise((resolve, reject) => {
        const success = 0; 
        setTimeout(() => {
            if(success) {
                resolve("Data received successfully!");
            } else {
                reject("Failed to receive data.");
            }
        }, 2000);
    });
};

getData()
    .then((message) => {
        console.log(message);
    })
    .catch((error) => {
        console.log(error);
    });

console.log("Fetching data...");