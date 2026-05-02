# [InvoiceMailer](./TEST_TASK.md)

A NestJS service that generates PDF invoices and sends them via email.

## Tech Stack

- **NestJS** — framework
- **PostgreSQL** + **Prisma** — database & ORM
- **BullMQ** + **Redis** — async job queues
- **PDFKit** — PDF generation
- **Nodemailer** — email delivery
- **Swagger** — API documentation

## Prerequisites

- Node.js 20+
- Docker & Docker Compose

## Setup

**1. Clone the repository**

```bash
git clone
cd invoicemailer
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment**

```bash
cp .env.example .env
```

Fill in `.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/invoicemailer
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass
SENDER_BRAND=Brick and Willow Design
SENDER_NAME=Margaret Brick
SENDER_ADDRESS=123 Business Ave, Suite 100
SENDER_CITY=New York, NY 10001
SENDER_EMAIL=billing@invoicemailer.com
SENDER_PHONE=+1 (555) 000-0000
```

**4. Start infrastructure**

```bash
docker-compose up -d
```

**5. Run migrations & seed**

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

**6. Start the app**

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

## API

Swagger UI available at: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### POST /invoices

Submit an invoice request.

**Request:**

```json
{
	"email": "john.doe@example.com",
	"items": [
		{ "description": "Logo design", "amount": 150 },
		{ "description": "Landing page", "amount": 300 }
	]
}
```

**Response `202 Accepted`:**

```json
{
	"message": "Invoice accepted",
	"email": "john.doe@example.com"
}
```

**Errors:**

| Code | Reason                                                          |
| ---- | --------------------------------------------------------------- |
| 400  | Validation failed (invalid email, empty items, negative amount) |
| 404  | Client with given email not found in database                   |
| 500  | Internal server error                                           |

## Flow

```
POST /invoices
│
▼
InvoicesService
├── Log request to DB (status: RECEIVED)
├── Fetch client from DB by email
└── Enqueue job → pdf-queue
│
▼
PdfWorker
├── Generate PDF (PDFKit)
├── Update DB (status: PDF_GENERATED)
└── Enqueue job → email-queue
│
▼
EmailWorker
├── Send email with PDF attachment (Nodemailer)
└── Update DB (status: SENT | FAILED)
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

### Manual test with curl

```bash
curl -X POST http://localhost:3000/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "items": [
      { "description": "Logo design", "amount": 150 },
      { "description": "Landing page", "amount": 300 }
    ]
  }'
```

## Database (Prisma)

All database operations are handled via Prisma.

```bash
npm run db:migrate   # run migrations (dev)
npm run db:generate  # generate Prisma client
npm run db:deploy    # apply migrations (prod)
npm run db:seed      # seed database
npm run db:studio    # open Prisma Studio
```

## Development

PDF previews are saved to `public/dev_previews/` in development mode.
