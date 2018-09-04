# Note this secret has to be same for company-web & company-api in order to make CSRF work
# As FE uses staging ENV for local testing, this should be in sync with Staging API Secret
export OC_SECRET_KEY_BASE='b1f0ff90cd692556f9740a8e609f88f2f4fc15d9dda9035445a7577c3f94936eaae91a0793c4ad5500314fe5a526a3b3f7c7c71c303f883d903df138783a8225'

# Base Url
export OC_BASE_URL='https://cms.developmentost.com'

# Cloudfront details
export OCW_CLOUDFRONT_DOMAIN=''

# Basic Auth credentials
export OCW_BASIC_AUTH_USERNAME='ost'
export OCW_BASIC_AUTH_PASSWORD='A$F^&n!@$ghf%7'

# ost web information
export OCW_OST_URL='http://developmentost.com:8080'

# Sha256 salt
export OCW_SHA256_SECRET_SALT='40a8e609f88f2f4fc15d9dda9035445a7577c3f94936eaae91a0793c'