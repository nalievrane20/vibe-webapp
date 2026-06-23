const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

function getAuthHeader() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export async function createCheckoutSession({
  amount,
  description,
  referenceNumber,
  successUrl,
  cancelUrl,
  customerEmail,
  customerName,
}: {
  amount: number; // in PHP, e.g. 250.00
  description: string;
  referenceNumber: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
  customerName: string;
}) {
  const res = await fetch(`${PAYMONGO_API_URL}/checkout_sessions`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          description,
          line_items: [
            {
              currency: "PHP",
              amount: Math.round(amount * 100), // PayMongo expects centavos
              name: description,
              quantity: 1,
            },
          ],
          payment_method_types: ["gcash", "card", "paymaya"],
          reference_number: referenceNumber,
          success_url: successUrl,
          cancel_url: cancelUrl,
          billing: {
            name: customerName,
            email: customerEmail,
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PayMongo error: ${errText}`);
  }

  const json = await res.json();
  return {
    checkoutId: json.data.id as string,
    checkoutUrl: json.data.attributes.checkout_url as string,
  };
}