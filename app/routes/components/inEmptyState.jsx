import { EmptyState, LegacyCard } from '@shopify/polaris'

const InEmptyState = ({setEmptyState, setSelectedTimeFrame, setMinumunViews, setDisplayText, shop, showToast, setIsPageLoading}) => {
  const handleButtonClick = async () => {
    setIsPageLoading(true)
    try {
      const response = await fetch(
        "https://views-count-shopify.onrender.com/api/store/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            store_name: shop
          }),
        }
      );
      if (response.ok) {
        showToast("Settings Initialized.");
        setSelectedTimeFrame("1day");
        setDisplayText("[count] views in last [time]");
        setMinumunViews(0);
        setEmptyState(false);
      } else {
        showToast("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error updating store settings:", error);
      showToast("error");
    } finally {
      setIsPageLoading(false)
    }
  };
  return (
    <LegacyCard sectioned>
      <EmptyState
        heading="Welcome!"
        action={{content: 'Let\'s Go !', onAction: ()=>{handleButtonClick()}}}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>First time using the app? Start by initializing your settings. </p>
      </EmptyState>
    </LegacyCard>
  )
}

export default InEmptyState