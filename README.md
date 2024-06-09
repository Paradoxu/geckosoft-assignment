# Run the project

On a new terminal tab run within the root of the project context:
> docker compose up -d

On the browser head to `http://localhost:3000/swagger` to see the swagger UI.

# Architecture

The stack used is composed by:

- NestJS + Express to handle HTTP requests
  - For the semplicity of this application, a simple NodeJS app with plain ExpressJS or Fastify could do the job,
  but using Nest gives us a few easier tools out of the box, such as OpenAPI interface, request data validation...
  After all Nest is just a higher level tool capable of abstracting express/fastify APIs.

- Mongo for persistent storage
  - Mongo is used as the main persistent storage as its API is quite simple and friendly for javascript developers
  to read/write.

- Redis (Optional) to keep track of workers using Bull as the Queue manager.
  - For asynchronous tasks and keep data in memory as a cache, Redis is a perfect easy solution, for the purpose of this project using such database isn't fully required since tasks can be stored in memory and BullJS actually offers that possibility as well, but to better represent a real world scenario where a server can crash and the cache may be lost, I prefered to implement a basic solution with a permanent memory database.

- The file structure of the API is divided into feature modules with an Angular-like design since Nest is basically Angular for the backend. This structure helps the backend keep all the dependencies needed for a single feature within its own module (folder), making it easier to delete/move/maintain the feature in the future.

```
src
└───media - (Feature module to handle any sort of "media" interaction)
│   │   media.module.ts - (Injects all the dependencies needed for the feature)
│   │   media.service.ts - (Responsible for the actual implementation of methods)
│   │   media.dto.ts - (Implements the types needed for this module)
│   │   media.entity.ts - (Maps the database entity for this feature)
│   │   media.controller.ts - (Exposes our API to the external word either via HTTP, gRPC...)
│   │   media.consumer.ts - (A simple service to be called whenever there is the need to run a new Async job)
│   │   media.utils.ts - (Implements utilities functions for the feature module)
```

<br /><br />

# Challenge requirements

- As stated in the assignment, the API should display a list of files by their name. While this is totally possible, I've decided to return the entire object from the database as it also contains the id property, that can be used in other requests to perform operations on a specific image, as in a real world scenario images from different users can have the same name, also having a file name as our primary key can lead to problems when making requests on to the API, since filenames can contain unwanted characters.

<br /><br />

# Endpoints

<details>
 <summary><code>GET</code> <code><b>/swagger</b></code> <code>(Displays the swagger UI)</code></summary>
</details>
<br />
<details>
 <summary><code>GET</code> <code><b>/media</b></code> <code>(Returns a paginated list of media entries from the database)</code></summary>

##### Query Parameters 

> | Name      |  Required | Type               | Description  | Default |
> | --------- | --------- | ------------------ | ------------ | ------- |
> | skip      |  false    | Number | How many records to skip on the pagination  | 0
> | limit     |  false    | Number | How many records to take per request | 20

</details>
<br />
<details>
 <summary><code>POST</code> <code><b>/media</b></code> <code>(Upload a new media file and stores the entry on the database)</code></summary>

##### Body Parameters

> | Name      |  Required | Type               | Description  | Default |
> | --------- | --------- | ------------------ | ------------ | ------- |
> | file      |  true     | Binary             | The binary representation of the file to be uploaded| N.A

</details>
<br />
<details>
 <summary><code>DELETE</code> <code><b>/media/{id}</b></code> <code>(Deletes the entry with the given ID from the database, also removes the file from the filesystem)</code></summary>

##### Path Parameters

> | Name      |  Required | Type               | Description  | Default |
> | --------- | --------- | ------------------ | ------------ | ------- |
> | id        |  true     | String             | The ID of the media object to be deleted | N.A

</details>
<br />
<details>
 <summary>
    <code>PATCH</code> 
    <code><b>/media/resize/{id}</b></code> 
  </summary>

##### Body Parameters

> | Name      |  Required | Type               | Description  | Default |
> | --------- | --------- | ------------------ | ------------ | ------- |
> | id        |  true     | String             | The ID of the media associated with the image to be resized | N.A
> | width     |  true     | Number             | The new width of the image after resizing | N.A
> | height     |  true     | Number             | The new height of the image after resizing | N.A

</details>
<br />
<details>
 <summary>
    <code>GET</code> 
    <code><b>/media/queued-jobs</b></code> 
    <code>(For debugging purposes of this project, this endpoint returns a list of queued jobs on Redis, ideally jobs should actually be stored in mongo so that the UI can display a table showing their status.)</code>
  </summary>

##### Body Parameters

> | Name      |  Required | Type                                                                    | Description  | Default |
> | --------- | --------- | ---------------------------------------------------------------------- | ------------ | ------- |
> | status    |  true     | 'completed', 'waiting', 'active', 'delayed', 'failed', 'paused'             | The ID of the media associated with the image to be resized | N.A

</details>