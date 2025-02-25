import "./DiscoverLogo.css"
function DiscoverLogo({image,name}){
    return(
        <div className="Logo">
            <img src={image} alt={name}></img>

        </div>
    )
}
export default DiscoverLogo