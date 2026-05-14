export const deliveryOptions = [
  {
    value: "pudo-locker",
    label: "PUDO locker to locker",
    feeZar: 50,
    detailsLabel: "Destination PUDO locker details",
    detailsPlaceholder:
      "PUDO locker name/location and any details needed for delivery",
  },
  {
    value: "pudo-door",
    label: "PUDO delivery to your address",
    feeZar: 80,
    detailsLabel: "Delivery address",
    detailsPlaceholder: "Street address, suburb, city, province, postal code",
  },
] as const;

export function getDeliveryOption(value?: string) {
  return deliveryOptions.find((option) => option.value === value);
}
