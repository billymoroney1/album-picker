#To clone this app:

1. "npm i" to install dependencies

2. Create an album_picker database in Postgres, config file should be set up accordingly

3. Create the following models in a Postgres database using Sequelize:

    - --name album --attributes name:string,artist:string,releaseYear:string,pictureUrl:string,spotify:string,userId:integer
    - --name playlist --attributes name:string,userId:integer
    - --name track --attributes name:string,pictureUrl:string,length:string,playlistId:integer
    - --name user --attributes name:string,email:string,password:string

4. Setup Spotify API

    - Create an account on the Spotify for Developers site, register your app, and replace the clientId and clientSeceret values in the index.js:

        let spotifyApi = new SpotifyWebApi({
            clientId: '0a36f996eac1468cb98f0f1e9746dcbe',
            clientSecret: 'aa2291e2834447059749e58155c3242a',
            redirectUri: 'http://localhost:8888/callback'
    })

5. The app runs on port 8000 by default




