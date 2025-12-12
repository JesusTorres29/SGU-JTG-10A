const TestController = {};

import { API_URL } from '../services/api';

TestController.callToApi = async () => {
    await fetch(
        `${API_URL}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
    ).then(response => response.json()).then(response => {
        console.log(response);
    }).catch(console.log);
}

export default TestController;