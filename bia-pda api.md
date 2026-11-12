# BIA PDA API

Base URL:

```text
https://<authguard-host>:3026/v3/api/auth/pda
```

The PDA login endpoint authenticates with the same employee credentials as AuthGuard and returns the user's assigned roles and permissions. Use its bearer token for the operator list endpoint. Operator results include active and inactive accounts assigned to the `Operator` role; credential fields are never returned.

## Login

`POST /login`

Request:

```http
Content-Type: application/json
```

```json
{
  "employeeCode": "E1001",
  "authCode": "your-password"
}
```

Success response (`200`):

```json
{
  "status": 200,
  "message": "PDA user logged in successfully",
  "result": {
    "id": 12,
    "employeeCode": "E1001",
    "employeeName": "Example User",
    "roles": [
      {
        "id": 4,
        "name": "Operator",
        "enabled": true,
        "permissions": [
          {
            "id": 21,
            "name": "pda:scan",
            "appname": "BIA WMS",
            "enabled": true
          }
        ]
      }
    ]
  },
  "token": "<bearer-token>"
}
```

Each role includes its assigned permissions. Invalid credentials return `401`; disabled accounts return `403`.

## List Operator users

`GET /operators`

Returns all accounts assigned to the `Operator` role, including inactive accounts. The result contains employee details, active status, and the matching role; it does not include credentials.

Request:

```http
Authorization: Bearer <bearer-token>
```

Success response (`200`):

```json
{
  "status": 200,
  "message": "Operator users retrieved successfully",
  "result": [
    {
      "id": 12,
      "employeeCode": "E1001",
      "employeeName": "Example User",
      "isActive": true,
      "roles": [
        {
          "id": 4,
          "name": "Operator"
        }
      ]
    }
  ]
}
```

Unauthenticated requests return `401`. An empty `result` means no users are currently assigned to the `Operator` role.
