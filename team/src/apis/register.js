import { DOMAIN } from "./config"


export const registerApi = async(bodyObject) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObject)
    };

    // try {
    //     const response = await fetch(`${DOMAIN}/users`, requestOptions);
    //    // response = await response.json();

    //     // if (response.ok) {
    //     //     return [result, ''];
    //     // }

    //     // return ['', result.errors || 'Unknown server error'];
    //     if (response.ok) {
    //        const response = await response.json();

    //         return [response, ''];
    //     }
    //     const errorJson = JSON.parse(response); 
    //     const errorMessage = errorJson.errors || errorJson.message || 'An unknown error occurred';
    //     console.log(errorMessage)
    //     return ['', `Server side error: ${errorMessage} `];
    // } catch (error){
    //     return ['',`Server down: ${error}`]
    // }
    try {
        const response = await fetch(`${DOMAIN}/users`, requestOptions);
    
        if (response.ok) {
            
            return [response, ''];
        }
    
        // Handle non-OK responses
        const errorText = await response.text(); // Extract the raw text from the response
        let errorMessage = '';
    
        try {
            const errorJson = JSON.parse(errorText); // Attempt to parse the error text as JSON
            errorMessage = errorJson.errors || errorJson.message || 'An unknown error occurred';
        } catch (parseError) {
            errorMessage = 'Failed to parse server error'; // Fallback if response is not JSON
        }
    
        console.error(errorMessage); // Log the error for debugging
        return ['', `Server side error: ${errorMessage}`];
    
    } catch (networkError) {
        // Handle network errors (e.g., server is down, connection refused)
        console.error(`Network error: ${networkError}`);
        return ['', `Server down: ${networkError.message}`];
    }
    
}