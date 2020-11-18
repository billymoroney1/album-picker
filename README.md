#To clone this app:

1. "npm i" to install dependencies

2. Create an album_picker database in Postgres, config file should be set up accordingly

3. Create the following models in a Postgres database using Sequelize:

    - --name album --attributes name:string,artist:string,releaseYear:string,pictureUrl:string,spotify:string,userId:integer
    - --name playlist --attributes name:string,userId:integer
    - --name track --attributes name:string,pictureUrl:string,length:string,playlistId:integer
    - --name user --attributes name:string,email:string,password:string

4. Setup Spotify API

    - Create an account on the Spotify for Developers site, and register your app. Create a .env file and add values for CLIENT_ID and CLIENT_SECRET.

5. The app runs on port 8000 by default

#To use this app:

Once you make an account, type in a search to receive artist, album, and track results. Click on the playlists tab to create playlists. Anywhere you see track results, you will be able to add them to an existing playlist. Add albums to your library from the results page, or click on an artists name to see all of their albums. Go to your library to see all of the albums you have saved.



