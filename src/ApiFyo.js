module.exports = class ApiFyo {
    constructor(env = ""){
        this.env = env; //dev = "dev" | tst = "tst" | stg = "stg" | prd = ""
        this.expireDate;
        this.token = '';
        this.baseUrl = `https://${env}api.fyo.com`;
    }
    async login(username, password, clientId){
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    
        let urlencoded = new URLSearchParams();
        urlencoded.append("client_id", clientId);
        urlencoded.append("username", username);
        urlencoded.append("password", password);
        urlencoded.append("scope", `openid ${clientId}`);
        urlencoded.append("grant_type", "password");
        urlencoded.append("response_type", "token id_token");
    
        let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
        };
    
        let response = await fetch(`${this.baseUrl}/token`, requestOptions)
        if (!response.ok) throw new Error(await response.text());
        let data = await response.json()
        this.token = data.access_token;
        this.expireDate = this.getExpireDate(parseInt(data.expires_in));
        return data; 
    }
    parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    }
    getExpireDate(seconds) {
        const date = new Date();
        return new Date(date.getTime() + seconds*1000);
    }
    
    async post(endpoint, reqBody){
        var myHeaders = new Headers();
        myHeaders.append("Authorization", this.token);
        myHeaders.append("Content-Type", "application/json");
    
        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(reqBody),
        redirect: 'follow'
        };
    
        var response = await fetch(`${this.baseUrl}/${endpoint}`, requestOptions);
        if (!response.ok) throw new Error(await response.text());
        return await response.json(); 
    }
}