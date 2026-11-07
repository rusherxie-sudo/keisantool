// Standalone experimental model. No analytics, storage, product catalogue, or production route.
const units = {mL:['volume',1],L:['volume',1000],g:['mass',1],kg:['mass',1000],piece:['count',1]};
function number(value, name, positive = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || (positive ? value <= 0 : value < 0)) throw new RangeError(`${name}を確認してください。`);
  return value;
}
export function compareProducts(products, periodDays) {
  number(periodDays,'比較日数',true);
  if (!Array.isArray(products) || !products.length) throw new RangeError('商品を入力してください。');
  let dimension;
  const results=products.map(p=>{
    const quantity=number(p.quantity,'容量',true),dose=number(p.dose,'1回の使用量',true);
    const price=number(p.price,'税込価格'),perDay=number(p.perDay,'1日の回数'),points=number(p.points,'ポイント');
    const unit=units[p.unit],doseUnit=units[p.doseUnit];
    if (!unit || !doseUnit || unit[0] !== doseUnit[0] || (dimension && dimension !== unit[0])) throw new RangeError('同じ種類の単位で比較してください。gとmLは換算しません。');
    dimension=unit[0];
    const uses=quantity*unit[1]/(dose*doseUnit[1]);
    const demand=periodDays*perDay;
    // Tolerance only neutralizes floating arithmetic at exact pack boundaries.
    const packs=demand ? Math.max(1,Math.ceil(demand/uses-Number.EPSILON*Math.max(1,demand/uses)*4)) : 0;
    const r={uses,cashPerUse:price/uses,cashOutlay:price,points,daysToFinish:perDay?uses/perDay:null,periodPacks:packs,periodCash:packs*price};
    if (Object.values(r).some(v=>v!==null&&!Number.isFinite(v))) throw new RangeError('計算できる範囲を超えています。');
    return r;
  });
  return {products:results,cheapestPerUse:results.reduce((best,r,i)=>r.cashPerUse<results[best].cashPerUse?i:best,0)};
}
