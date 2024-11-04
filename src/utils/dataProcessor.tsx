
export interface BookingData {
    hotel: string;
    arrival_date_year: number;
    arrival_date_month: string;
    arrival_date_day_of_month: number;
    adults: number;
    children: number;
    babies: number;
    country: string;
    date?: string;
    total_visitors?: number;
}

export const processBookingData =  (): Promise<BookingData[]> => {
    return fetch('/data/hotel_bookings_1000.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load CSV data');
            }
            return response.text();
        })
        .then(csvData => {
            const lines = csvData
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (lines.length < 2) {
                console.error('CSV file has no data rows');
                return [];
            }

            const bookings = lines.slice(1).map(line => {
                try {

                    const columns = line.split(',').slice(0, 8).map(item => item.trim());

                    if (columns.length < 8) {
                        console.error('Invalid line format:', line);
                        return null;
                    }

                    const [
                        hotel,
                        arrival_date_year,
                        arrival_date_month,
                        arrival_date_day_of_month,
                        adults,
                        children,
                        babies,
                        country
                    ] = columns;

                    const year = parseInt(arrival_date_year);
                    if (isNaN(year) || year < 1900 || year > 2100) return null;
                    if (!isValidMonth(arrival_date_month)) return null;
                    const day = parseInt(arrival_date_day_of_month);
                    if (isNaN(day) || day < 1 || day > 31) return null;
                    const numAdults = parseInt(adults) || 0;
                    const numChildren = parseInt(children) || 0;
                    const numBabies = parseInt(babies) || 0;

                    const booking: BookingData = {
                        hotel: hotel.trim(),
                        arrival_date_year: year,
                        arrival_date_month: arrival_date_month.trim(),
                        arrival_date_day_of_month: day,
                        adults: numAdults,
                        children: numChildren,
                        babies: numBabies,
                        country: country.trim(),
                        date: formatDate(year, arrival_date_month, day),
                        total_visitors: numAdults + numChildren + numBabies
                    };

                    return booking;
                } catch (error) {
                    console.error('Error processing line:', line, error);
                    return null;
                }
            }).filter((booking): booking is BookingData => booking !== null);

            return bookings.length ? bookings : [];
        })
        .catch(error => {
            console.error('Error processing booking data:', error);
            return [];
        });
};

const isValidMonth = (month: string): boolean => {
    const validMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return validMonths.includes(month.trim());
};

const formatDate = (year: number, month: string, day: number): string => {
    const monthNumber = getMonthNumber(month);
    return `${year}-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getMonthNumber = (month: string): number => {
    const months: { [key: string]: number } = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
        'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
    };
    return months[month.trim()] || 1;
};



export interface GroupedData {
    country: string;
    total_visitors: number;
}

export interface DateGroupedData {
    date: string;
    total_visitors: number;
}

export const groupByCountry = (data: BookingData[]): GroupedData[] => {
    const grouped = data.reduce((acc, curr) => {
        if (!curr.country) return acc;

        const country = curr.country.trim();
        if (!acc[country]) {
            acc[country] = {
                total_visitors: 0,
            };
        }

        acc[country].total_visitors += curr.total_visitors || 0;

        return acc;
    }, {} as { [key: string]: { total_visitors: number } });

    return Object.entries(grouped)
        .map(([country, data]) => ({
            country,
            total_visitors: data.total_visitors,
        }))
        .sort((a, b) => b.total_visitors - a.total_visitors);
};


export const groupByDate = (data: BookingData[]): DateGroupedData[] => {
    const grouped = data.reduce((acc, curr) => {
        const date = curr.date;
        if (!date) return acc;

        if (!acc[date]) {
            acc[date] = {
                total_visitors: 0,
            };
        }

        acc[date].total_visitors += curr.total_visitors || 0;

        return acc;
    }, {} as { [key: string]: { total_visitors: number } });

    return Object.entries(grouped)
        .map(([date, data]) => ({
            date,
            total_visitors: data.total_visitors,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
};



