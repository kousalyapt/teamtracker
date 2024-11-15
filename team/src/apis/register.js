import { DOMAIN } from "./config"


export const registerApi = async(bodyObject) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObject)
    };

    try {
        const response = await fetch(`${DOMAIN}/users`, requestOptions);
        const result = await response.json();

        if (response.ok) {
            return [result, ''];
        }

        return ['', result.errors || 'Unknown server error'];
        // if (response.ok) {
        //     const response = await response.json();

        //     return [response, ''];
        // }
        // const errorMessage = await response.text();
        // return ['', `Server side error: ${errorMessage} `];
    } catch (error){
        return ['',`Server down: ${error}`]
    }
}