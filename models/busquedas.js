const axios = require('axios').default;
const fs = require('fs');

class Busquedas{

    historial = [];
    dbPath = './database/database.json';

    constructor(){
        //Recordar leer DB
        this.leerDB();        
    }

    get historialCapitalizado(){
        return this.historial.map((historial) =>{
            let palabras = historial.split(' ')
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ');
        })

        
    }

    get ParamsMapBox(){

        const params = {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
        return params;
    }

    async ciudades(lugar = ''){
        //Peticion HTTP
        try {
            const instance = axios.default.create({
                baseURL:`https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.ParamsMapBox
            });
            const resp = await instance.get();            
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
        } catch (error) {
            return error;
        }
        

    }

    async clima(lat, lng){

        try {

            const instance = axios.default.create({
                baseURL:'https://api.openweathermap.org/data/2.5/weather',
                params: {
                    'lat': lat,
                    'lon': lng,
                    'appid': process.env.OPEN_WEATHER_KEY,
                    'units': 'metric',
                    'lang' : 'es'

                }
            });
             

            const resp = await instance.get();
            const {weather, main} = resp.data;
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            };
            
        } catch (error) {
            console.log(error);
        }
    }

    addHistorial(lugar = ''){

        if(this.historial.includes(lugar.toLocaleLowerCase())){
            return;
        }
        this.historial.splice(5)
        this.historial.unshift(lugar.toLocaleLowerCase());

        //Guardar en db
        this.guardarDB();
    }

    guardarDB(){

        const payload = {
            historial: this.historial
        }
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB(){
        if(!fs.existsSync(this.dbPath)){
            return null;
        }
    
        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);
        
        return this.historial = data.historial;
    }

}

module.exports = Busquedas;