import apolloClient from "@/lib/apollo-client";
import { CREATE_GUEST_CART, ADD_ITEMS_TO_GUEST_CART, REMOVE_ITEMS_FROM_GUEST_CART } from "@/graphql/mutations";
import { GET_GUEST_CART } from "@/graphql/queries.mjs";
import { GoKwikCheckoutParams, GuestCartResponse } from "@/types/gokwik";
import { decodeBase64 } from "@/utils/utils.mjs";
import { analytics, GTM_EVENTS } from "@/utils/analytics";
import { detectPlatform, detectDevice } from "@/utils/utils.mjs";


export class GoKwikService {
  // Create a guest cart
  static async createGuestCart(): Promise<GuestCartResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_GUEST_CART,
      });
      return data.createGuestCart;
    } catch (error) {
      console.error("Error creating guest cart:", error);
      throw error;
    }
  }

  // Add items to guest cart
  static async addItemsToGuestCart(cartId: string, listingId: string, quantity: number): Promise<GuestCartResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: ADD_ITEMS_TO_GUEST_CART,
        variables: {
          cartId,
          items: [
            {
              listingId,
              quantity,
            }
          ],
        },
      });
      return data.addItemsToGuestCart;
    } catch (error) {
      console.error("Error adding items to guest cart:", error);
      throw error;
    }
  }

  // Remove items from guest cart
  static async removeItemsFromGuestCart(itemIds: string[]): Promise<GuestCartResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REMOVE_ITEMS_FROM_GUEST_CART,
        variables: { itemIds },
      });
      return data.removeItemsFromGuestCart;
    } catch (error) {
      console.error("Error removing items from guest cart:", error);
      throw error;
    }
  }

  // Get guest cart data
  static async getGuestCart(guestCartId: string): Promise<any> {
    try {
      const { data } = await apolloClient.query({
        query: GET_GUEST_CART,
        variables: { guestCartId },
        fetchPolicy: 'network-only', // Always fetch fresh data
      });
      return data.guestCart;
    } catch (error) {
      console.error("Error fetching guest cart:", error);
      throw error;
    }
  }

  // Initialize GoKwik SDK
  static loadScript(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('gokwik-script')) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'gokwik-script';
      script.src = process.env.NEXT_PUBLIC_GOKWIK_SCRIPT_URL || '';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load GoKwik script'));

      document.head.appendChild(script);
    });
  }

  // Initialize GoKwik checkout
  static initializeCheckout(params: GoKwikCheckoutParams): Promise<boolean> {


    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.gokwikSdk) {
        try {
          // Set up event listeners for checkout events
          window.gokwikSdk.on('checkout-initiation-failure', (data) => {
            console.error('GoKwik checkout initiation failed:', data);
            if (params.onError) {
              params.onError({
                message: data.failure_reason || 'Checkout initiation failed',
                code: 'INITIATION_FAILURE'
              });
            }
            // track checkout failed event
            if (typeof window.analytics !== 'undefined') {
              analytics.trackCheckoutFailed({
                ...params.customerInfo,
                items: [],
                value: params.amount,
                phone: params.customerInfo?.phone || '',
                email: params.customerInfo?.email || '',
                error_message: data.failure_reason || 'Checkout initiation failed',
              });
            }
           
            // toast({
            //   title: 'Checkout failed',
            //   description: data.failure_reason || 'Checkout initiation failed',
            // });
          });

          // Order complete event
          window.gokwikSdk.on('order-complete', (order) => {
           

            // Close the GoKwik dialog to ensure redirection works
            setTimeout(() => {
              if (window.gokwikSdk && typeof window.gokwikSdk.close === 'function') {
                window.gokwikSdk.close();
              }




              // track order complete event
              if (typeof window.analytics !== 'undefined') {
                const eventData = {
                  transaction_id: order.transaction_id || order.transactionId || '',
                  order_id: decodeBase64(order.merchant_order_id || order.orderId || ''),
                  value: order.total || order.amount || 0,
                  payment_mode: order.payment_mode || 'GOKWIK',
                  currency: "INR",
                  items: order.items || [],
                  sku_ids: order.sku_ids || [],
                  platform: detectPlatform(),
                  device: detectDevice(),
                  quantity: order.items.length,
                  content_type: 'product'

                }
               
                analytics.trackOrderConfirmed(eventData);




              }


              // Clear guest cart ID from localStorage
              localStorage.removeItem('gokwik_guest_cart_id');

              // Clear any other cart-related data from localStorage
              localStorage.removeItem('cart_items');
              localStorage.removeItem('cart_id');

              // Call the success callback
              if (params.onSuccess) {
                params.onSuccess({
                  orderId: order.merchant_order_id || order.orderId || '',
                  transactionId: order.transaction_id || order.transactionId || '',
                  amount: order.total || order.amount || 0,
                  status: order.status || 'SUCCESS',
                  redirectUrl: order.redirectUrl || null,
                  merchant_order_id: order.merchant_order_id || '',
                  gokwik_order_id: order.gokwik_order_id || ''
                });
              }

              // Force redirect if needed - use merchant_order_id as the primary ID
              if (order.merchant_order_id && typeof window !== 'undefined') {
                setTimeout(() => {
                  window.location.href = `/checkout/order-success/${order.merchant_order_id}`;
                }, 500);
              }
            }, 1000);
          });

          // Order failed event
          window.gokwikSdk.on('order-failed', (data) => {
           
            if (params.onError) {
              params.onError({
                message: data.failure_reason || 'Order failed',
                code: 'ORDER_FAILED'
              });
            }



          });

          // Address events
          window.gokwikSdk.on('address-add', (address) => {
           
            // Track address add event
            // Track address selected event
            if (typeof window.analytics !== 'undefined') {


              analytics.track(GTM_EVENTS.PHONE_ADDED, { phone: address.recipient_phone, user_type: address.existing ? 'existing_user' : 'new_user' });
              analytics.track(GTM_EVENTS.EMAIL_ADDED, { email: address.email });

              analytics.trackSignUp({
                email: address.email,
                phone: address.recipient_phone,
                source: "gokwik_checkout",
                user_type: address.existing ? 'existing_user' : 'new_user',
                full_name: address.first_name + ' ' + address.last_name,
                address: address.address,
                city: address.city,
                state: address.state,
                country: address.country,
                pincode: address.pincode,
                timestamp: new Date().toISOString(),
              });







            }
          });

          window.gokwikSdk.on('address-selected', (address) => {
           
            

            // Track address selected event
            if (typeof window.analytics !== 'undefined') {


              analytics.track(GTM_EVENTS.PHONE_ADDED, { phone: address.recipient_phone, user_type: address.existing ? 'existing_user' : 'new_user' });
              analytics.track(GTM_EVENTS.EMAIL_ADDED, { email: address.email });

              analytics.trackSignUp({
                email: address.email,
                phone: address.recipient_phone,
                source: "gokwik_checkout",
                user_type: address.existing ? 'existing_user' : 'new_user',
                full_name: address.first_name + ' ' + address.last_name,
                address: address.address,
                city: address.city,
                state: address.state,
                country: address.country,
                pincode: address.pincode,
                timestamp: new Date().toISOString(),
              });










            }





          });

          window.gokwikSdk.on('gk_address_continue', (selectedAddress) => {
           
            // Track address continue event
            if (typeof window.analytics !== 'undefined') {
              window.analytics.track("GOKWIK_ADDRESS_CONTINUE", { selectedAddress });
            }
          });







          // user-login-initiated
          // {
          //   "phoneNumber": "973156101",
          //   "user_type":  "new_user" // new_user | existing_user
          // }
          window.gokwikSdk.on('user-login-initiated', (data) => {
           

            // track phone added event
            if (typeof window.analytics !== 'undefined') {
              analytics.track(GTM_EVENTS.PHONE_ADDED, { phone: data.phoneNumber, user_type: data.user_type });
            }




          });



          // gk_add_address_mobile_change
          // Event Name: navigation_payment_options

          // Description: Triggers when the user change mobile number on Address Input form.

          // Parameter: PhoneNumber

          window.gokwikSdk.on('gk_add_address_mobile_change', (data) => {
           
            // track phone added event
            if (typeof window.analytics !== 'undefined') {
              analytics.track(GTM_EVENTS.PHONE_ADDED, { phone: data.phoneNumber, user_type: data.user_type });
            }




          });


          // gk_add_new_address_email_fill
          // Event Name: gk_add_new_address_email_fill

          // Description: Triggers when the user enters email on the address Input form. It will get triggered after 2s user stop typing.

          // Parameter: email

          window.gokwikSdk.on('gk_add_new_address_email_fill', (data) => {
           
            // track email added event
            if (typeof window.analytics !== 'undefined') {
              analytics.track(GTM_EVENTS.EMAIL_ADDED, { email: data.email });

              analytics.trackSignUp({
                email: data.email,
                phone: data.phoneNumber,
                source: "gokwik_checkout",
                timestamp: new Date().toISOString(),
              });
            }




            
          });

          // Initialize the checkout
          

          window.gokwikSdk.initCheckout({
            environment: process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? 'production' : 'sandbox',
            type: "merchantInfo",
            mid: process.env.NEXT_PUBLIC_GOKWIK_MID || '',
            phoneNumber: params.customerInfo?.phone || null,
            bannerMessages: ["Fast & Secure Checkout", "100% Authentic Products"],
            merchantParams: {
              merchantCheckoutId: decodeBase64(params.merchantCheckoutId),
              origReferrer: window.location.href,
            }
          });

          resolve(true);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('GoKwik SDK not loaded'));
      }
    });
  }

  // Close GoKwik checkout popup
  static closeCheckout(): void {
    if (typeof window !== 'undefined' && window.gokwikSdk) {
      window.gokwikSdk.close();
    }
  }
}

// Add GoKwik type to window
declare global {
  interface Window {
    gokwikSdk: {
      initCheckout: (params: any) => void;
      close: () => void;
      on: (event: string, callback: (data: any) => void) => void;
    };
    analytics?: {
      track: (event: string, data?: any) => void;
    };
  }
}
