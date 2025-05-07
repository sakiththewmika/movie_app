import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { ActivityIndicator, FlatList, FlatListComponent, Image, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import MovieCard from "@/components/MovieCard";
import { useEffect, useState } from "react";
import { updateSearchCount } from "@/services/appwrite";

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data : movies, 
        loading: moviesLoading, 
        error: moviesError,
        refetch: loadMovies,
        reset,
    } = useFetch(() => fetchMovies({
            query: searchQuery
        }), false
    );

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies();
                if (movies[0] && movies.length > 0) {
                    // Update search count in Appwrite
                    await updateSearchCount(searchQuery, movies[0]);
                }
            } else {
                reset();
            }
        }, 500);

        return () => clearTimeout(timeoutId);

    }, [searchQuery]);

    return (
        <View className="flex-1 bg-primary">
            <Image source={images.bg} className="absolute w-full z-0" />
                <FlatList
                    data={movies}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <MovieCard
                            {...item}
                        />
                    )}
                    numColumns={3}
                    columnWrapperStyle={{
                        justifyContent: 'center',
                        gap: 16,
                        marginVertical: 16
                    }}
                    className="px-5"
                    contentContainerStyle={{
                        paddingBottom: 100,
                    }}
                    ListHeaderComponent={
                        <>
                            <View className="w-full flex-row items-center justify-center mt-20">
                                <Image source={icons.logo} className="w-12 h-10" />
                            </View>
                            <View className="my-5">
                                <SearchBar
                                    placeholder="Search for a movie..."
                                    value={searchQuery}
                                    onChangeText ={(text: string) => setSearchQuery(text)}
                                />
                            </View>

                            {moviesLoading && (
                                <ActivityIndicator 
                                    size="large"
                                    color="#0000ff"
                                    className="my-3"
                                />
                            )}

                            {moviesError && (
                                <Text className="text-red-500 my-3 px-5">
                                    Error: {moviesError?.message}
                                </Text>
                            )}

                            {!moviesLoading && !moviesError && searchQuery.trim() && movies?.length > 0 && (
                                <Text className="text-xl text-white font-bold">
                                    Search Results for{" "}
                                    <Text className="text-accent">{searchQuery}</Text>
                                </Text>
                            )}
                        </>
                    }

                    ListEmptyComponent={
                        !moviesLoading && !moviesError ? (
                            <View className="px-5 mt-10">
                                <Text className="text-gray-500 text-center">
                                    {searchQuery.trim() ? 'No movies found' : 'Search for a movie...'}
                                </Text>
                            </View>
                        ) : null
                    }
                />
        </View>
    );
}
