# Architecture Decisions

- Ignore only unhandled promise rejections proven to originate from MetaMask's official extension ID, because an externally injected wallet failure must not blank this non-Web3 storefront or hide application errors.
