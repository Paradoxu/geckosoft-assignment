# API Endpoints


<details>
 <summary><code>GET</code> <code><b>/media</b></code> <code>(Returns a paginated list of media entries from the database)</code></summary>

##### Query Parameters 

> | Name      |  Required | Type               | Description  | Default |
> | --------- | --------- | ------------------ | ------------ | ------- |
> | skip      |  false    | Number | How many records to skip on the pagination  | 0
> | limit     |  false    | Number | How many records to take per request | 20

</details>

<details>
 <summary><code>POST</code> <code><b>/media</b></code> <code>(Upload a new media file and stores the entry on the database)</code></summary>

##### Body Parameters

> | Name      |  Required | Type               | Description  | Default |
> | --------- | --------- | ------------------ | ------------ | ------- |
> | file      |  true     | Binary             | The binary representation of the file to be uploaded| N.A

</details>

<details>
 <summary><code>DELETE</code> <code><b>/media/{id}</b></code> <code>(Deletes the entry with the given ID from the database, also removes the file from the filesystem)</code></summary>

##### Path Parameters

> | Name      |  Required | Type               | Description  | Default |
> | --------- | --------- | ------------------ | ------------ | ------- |
> | id        |  true     | String             | The ID of the media object to be deleted | N.A

</details>

