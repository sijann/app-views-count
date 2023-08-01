import { useCallback, useEffect, useState } from "react";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Button,
  Card,
  EmptyState,
  FormLayout,
  Frame,
  Grid,
  LegacyCard,
  LegacyStack,
  Page,
  Select,
  Spinner,
  Text,
  TextField,
  Toast,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import Test from "./components/test";
import InEmptyState from "./components/inEmptyState";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return json({ shop: session.shop.replace(".myshopify.com", "") });
};

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
          variants: [{ price: Math.random() * 100 }],
        },
      },
    }
  );

  const responseJson = await response.json();

  return json({
    product: responseJson.data.productCreate.product,
  });
}

export default function Index() {
  const nav = useNavigation();
  const { shop } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    ""
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId]);

  const [selectedTimeFrame, setSelectedTimeFrame] = useState("alltime");
  const [minimumViews, setMinimumViews] = useState(1);
  const [displayText, setDisplayText] = useState('{{ viewsCount }} people saw this in last {{ timeframe }}');




   const handleSelectChange = useCallback((value) => setSelectedTimeFrame(value), []);
  const handleMinimumViewsChange = useCallback((value) => setMinimumViews(value), []);
  const handleDisplayTextChange = useCallback((value) => setDisplayText(value), []);


  const options = [
    { label: "All time", value: "alltime" },
    { label: "Last 7 days", value: "1week" },
    { label: "Last 24 hours", value: "1day" },
    { label: "Last 60 minutes", value: "1hr" },
  ];

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const showToast = (type) => {
    if (type === "success") {
      setShowSuccessToast(true);
      setShowErrorToast(false);
    } else if (type === "error") {
      setShowErrorToast(true);
      setShowSuccessToast(false);
    }
  };

  const handleUpdate = async () => {
    setIsButtonLoading(true)
    try {
      const response = await fetch(
        "https://views-count-shopify.onrender.com/api/store",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            store_name: shop, // Replace with your store name
            session: "session1", // Replace with your session value
            settings: {
              timeframe: selectedTimeFrame,
              minimum_count_to_show: minimumViews, // Replace with the minimum count value from the input field
              displayText: displayText, // Replace with the display text from the input field
            },
          }),
        }
      );
      if (response.ok) {
        showToast("success");
      } else {
        showToast("error");
      }
    } catch (error) {
      console.error("Error updating store settings:", error);
      showToast("error");
    } finally {
      setIsButtonLoading(false)
    }
  };

  const [emptyState, setEmptyState] = useState(false);


  useEffect(() => {
    // Make the GET request inside the useEffect hook
    fetch(`https://views-count-shopify.onrender.com/api/store/check?store=${shop}`)
      .then((response) => response.json())
      .then((data) => {
       if(data.store){
        setSelectedTimeFrame(data.timeframe)
        setMinimumViews(data.minViews)
        setDisplayText(data.displayText)
        setEmptyState(false)
       }
       else{
        setEmptyState(true)
       }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        
      }).finally( ()=>{
        setIsPageLoading(false)
      });
  }, []);

  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  return (

    <Page>
      <ui-title-bar title="Products Views Counter">
      </ui-title-bar>
      {isPageLoading ? 
      <LegacyStack vertical alignment="center" distribution="center">
      <Spinner />
      </LegacyStack> : (
        emptyState ? <InEmptyState setEmptyState={setEmptyState} setSelectedTimeFrame={setSelectedTimeFrame} setDisplayText={setDisplayText} setMinumunViews={setMinimumViews} shop={shop} showToast={showToast} setIsPageLoading={setIsPageLoading} /> :
      <>
      <LegacyCard sectioned>
        <LegacyStack vertical>
          <Text as="h1" variant="headingMd">
            Settings
          </Text>
          <LegacyStack vertical wrap>
            <FormLayout>
            <FormLayout.Group condensed>
            <Select
              label="Show views from"
              options={options}
              onChange={handleSelectChange}
              value={selectedTimeFrame}
            />
            <TextField
              label="Minimum Views to show"
              type="number"
              value={minimumViews?.toString()} // Convert to string as TextField accepts string
              onChange={handleMinimumViewsChange}
              autoComplete="off"
            />
          </FormLayout.Group>

          <FormLayout.Group condensed>
            <TextField
              label="Display Text"
              multiline={2}
              type="text"
              value={displayText}
              helpText="Eg. '[count] people viewed this product in last [time]' will look like: '990 people viewed this product in last hour.' "
              onChange={handleDisplayTextChange}
              autoComplete="off"
            />
          </FormLayout.Group>
              <LegacyStack distribution="trailing">
                <Button  primary onClick={handleUpdate}>
                   { isButtonLoading ? <Spinner size="small" /> : "Update" }
                </Button>
              </LegacyStack>
            </FormLayout>
          </LegacyStack>
        </LegacyStack>
      </LegacyCard>
      <Frame>
        {showSuccessToast && (
          <Toast
            content="Store settings updated successfully!"
            onDismiss={() => setShowSuccessToast(false)}
          />
        )}
        {showErrorToast && (
          <Toast
            content="Error updating store settings."
            error
            onDismiss={() => setShowErrorToast(false)}
          />
        )}
      </Frame>

      </>
      
      )
    }
    </Page>
  );
}
