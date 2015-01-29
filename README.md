=======
foosball
========
[ ![Codeship Status for jakubsikora/foosball](https://codeship.com/projects/854ecd60-76f4-0132-4b15-421e8b4ad259/status?branch=master)](https://codeship.com/projects/55327) 

## Import of data
In development, export from the live database and import scores locally 

```bash
mongoexport --username foosball --password SecUre --host my.server:1337 --db foosball --collection scores --journal --out scores.json
mongoimport --db foosball --collection scores --file scores.json 
```
