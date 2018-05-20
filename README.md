WIP!

Example usage:

```
curl -u toto:password -H "Content-Type: application/json" -X POST -d '{"username":"USER","password":"PASS"}' http://localhost:3000/auth/alumnis
```

Then, with GraphQL:

```
query  {
  search(class: "2019", source: "alumnis") {
		id
		last_name
		first_name
  }
}
```