type Props = {};

export function CurrencyFormatter(
{
    amount,
     currency='USD',
     locale
    }: {
        amount:number,
        currency?: string,
        locale?: string
    }){
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(amount)
}


CurrencyFormatter.propTypes = {};

