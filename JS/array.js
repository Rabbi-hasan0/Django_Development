//---------------Array objects-------------\\ 
    const arr = [1, 2, 3, 4, 5, 6];
    const brr = [9, 8, 7, 10];

    const result = arr.concat(brr);
    console.log(result);

    const res_filter = result.filter(arr => (arr % 2==0));
    console.log(res_filter);

    const res_find = result.find(arr => (arr > 5));
    console.log(res_find);
    const res_find_ind = result.findIndex(arr => (arr > 5));
    console.log(res_find_ind);
    
    //--str to array--\\
    const str = "Rabbi";
    const c = Array.from(str);
    console.log(c);
    //--array to str--\\
    const carss = [1, 2, 3];
    const car = carss.toString();
    console.log(car[0]);

    const cars = ["BMW", "Volvo", "Saab", "Ford"];
    const res = cars.join("-");   
    console.log(res);
    brr.sort((a, b) => b - a);
    console.log(brr);