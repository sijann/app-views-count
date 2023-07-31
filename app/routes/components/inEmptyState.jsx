import { EmptyState, LegacyCard } from '@shopify/polaris'

const InEmptyState = () => {
  return (
    <LegacyCard sectioned>
      <EmptyState
        heading="Welcome!"
        action={{content: 'Let\'s Go !'}}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>First time using the app? Start by initializing your settings. </p>
      </EmptyState>
    </LegacyCard>
  )
}

export default InEmptyState