setwd('~/Documents/ucb-mids/w209/w209_homework/hw2/')

d <- read.csv('./flights2017/flights2017.csv')
head(d)
colnames(d)
unique(d$DEST_STATE_ABR)
unique(sort(d$ORIGIN_AIRPORT_ID))
unique(sort(d$DEST_AIRPORT_ID))


d$DEPD_15 <- ifelse(d$DEP_DELAY > 15, 1, 0)
d$ARRD_15 <- ifelse(d$ARR_DELAY > 15, 1, 0)
d$MINS_GAIN <- d$DEP_DELAY - d$ARR_DELAY
d$DATE <- as.Date(d$FL_DATE)
d$MONTH <- format(d$DATE, '%m')


DEPD_15_PERC <- aggregate(DEPD_15 ~ MONTH, d, function(x) {sum(x) / length(x) * 100})
ARRD_15_PERC <- aggregate(ARRD_15 ~ MONTH, d, function(x) {sum(x) / length(x) * 100})

FLTS <- aggregate(X.1 ~ MONTH, d, function(x) {length(x)})
FLTS_DEPD_LATE <- aggregate(DEPD_15 ~ MONTH, d, sum)
FLTS_ARRD_LATE <- aggregate(ARRD_15 ~ MONTH, d, sum)
FLTS <- merge(FLTS, FLTS_DEPD_LATE)
FLTS <- merge(FLTS, FLTS_ARRD_LATE)

PERC <- merge(DEPD_15_PERC, ARRD_15_PERC)
PERC <- merge(PERC, FLTS, all.y = TRUE)
PERC
write.csv(PERC, './flights2017/monthly_delay.csv')

write.csv(d, './flights2017/flights2017.csv')

a <- read.csv('./flights2017/airportidcodes.csv')
colnames(a)
head(a)

airport_ids <- unique(append(unique(a$ORIGIN_AIRPORT_ID), unique(a$DEST_AIRPORT_ID)))
airport_ids <- data.frame(airport_ids)
nrow(airport_ids)
airport_ids <- merge(airport_ids, a[, c("ORIGIN_AIRPORT_ID", "ORIGIN")], by.x = "airport_ids", by.y = "ORIGIN_AIRPORT_ID", all.x = TRUE)
airport_ids <- unique(airport_ids)
head(airport_ids)

coords <- read.csv('./flights2017/usairportscoords.csv')
head(coords)

airport_ids <- merge(airport_ids, coords, by.x = 'ORIGIN', by.y = 'locationID', all.x = TRUE)
nrow(airport_ids)
head(airport_ids)
colnames(airport_ids) <- c('AirportCode', 'AirportId', 'AirpLat', 'AirpLon')
write.csv(airport_ids, file = './flights2017/airport_codes.csv')
