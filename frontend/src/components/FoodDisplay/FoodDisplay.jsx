import {useContext, useMemo, useState} from 'react'
import './FoodDisplay.css'
import {StoreContext} from '../../context/storeContextObject'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({category}) => {
  const {food_list} = useContext(StoreContext)
  const [searchTerm, setSearchTerm] = useState("")
  const [quickFilter, setQuickFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Recommended")

  const filteredFoods = useMemo(() => {
    const result = food_list.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesQuickFilter =
        quickFilter === "All" ||
        (quickFilter === "Budget" && item.price <= 15) ||
        (quickFilter === "Veg" && !item.name.toLowerCase().includes("chicken")) ||
        (quickFilter === "Protein" && item.name.toLowerCase().includes("chicken"))
      return matchesCategory && matchesSearch && matchesQuickFilter
    })

    return result.sort((a, b) => {
      if (sortBy === "Low to high") return a.price - b.price
      if (sortBy === "High to low") return b.price - a.price
      return Number(a._id) - Number(b._id)
    })
  }, [category, food_list, quickFilter, searchTerm, sortBy])

  return (
    
      <div className ='food-display' id='food-display'>
        <div className="food-display-top">
          <div>
            <p>Fresh picks for your cravings</p>
            <h2>Top dishes near you</h2>
          </div>
          <input
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search dishes"
            type="search"
            value={searchTerm}
          />
        </div>
        <div className="food-display-controls">
          <div className="quick-filters">
            {["All", "Budget", "Veg", "Protein"].map((filter) => (
              <button
                className={quickFilter === filter ? "active" : ""}
                key={filter}
                onClick={() => setQuickFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
          <select onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
            <option>Recommended</option>
            <option>Low to high</option>
            <option>High to low</option>
          </select>
        </div>
        <div className="food-display-list" >
        {filteredFoods.map((item)=>(
          <FoodItem key={item._id}  id={item._id} name={item.name} description={item.description} price={item.price} image={item.image}/>
        ))}
        </div>
        {filteredFoods.length === 0 && <p className="food-display-empty">No dishes found. Try another search.</p>}
      </div>
    
  )
}

export default FoodDisplay
